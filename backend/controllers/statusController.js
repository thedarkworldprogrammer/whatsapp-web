const { uploadFIleToCloudinary } = require('../config/cloudinaryConfig');
const Status = require('../models/Status')
const response = require('../utils/responseHandler')


//send message to perticular user
exports.createStatus = async (req, res) => {
    try {
        const { content, contentType } = req.body;
        const userId = req.user.userId
        const file = req.file;

        let mediaUrl = null;
        let finalContentType = contentType || "text";


        //handle file upload
        if (file) {
            const uploadFIle = await uploadFIleToCloudinary(file);

            if (!uploadFIle?.secure_url) {
                return response(res, 400, 'failed to upload media')
            };
            mediaUrl = uploadFIle?.secure_url;

            if (file.mimetype.startsWith('image')) {
                finalContentType = 'image'
            } else if (file.mimetype.startsWith('video')) {
                finalContentType = 'video'
            } else {
                return response(res, 400, 'Unsupported file type')
            }
        } else if (content?.trim()) {
            finalContentType = 'text'
        } else {
            return response(res, 400, 'Message content is required')
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24)

        const status = new Status({
            user: userId,
            content: mediaUrl || content,
            contentType: finalContentType,
            expiresAt
        });

        await status.save();

        const populatedStatus = await Status.findById(status?._id)
            .populate('user', "username profilePicture")
            .populate('viewers', "username profilePicture")


        //Emit socket event
        if (req.io && req.socketUserMap) {
            //broadcast to all connection user except creator
            for (const [connectedUserId, socketId] of req.socketUserMap) {
                if (connectedUserId !== userId) {
                    req.io.to(socketId).emit('new_status', populatedStatus)
                }
            }
        }

        return response(res, 201, 'Status created successfully', populatedStatus)

    } catch (error) {
        console.error(error)
        return response(res, 500, 'Internal server error')
    }
}


exports.getStatuses = async (req, res) => {
    try {
        const statuses = await Status.find({
            expiresAt: { $gt: new Date() }
        })
            .populate('user', "username profilePicture")
            .populate('viewers', "username profilePicture")
            .sort({ createdAt: 1 }); // Sort oldest to newest so they play in order

        // Group statuses by user to match frontend expectations
        const groupedStatuses = {};
        
        statuses.forEach(status => {
            const userId = status.user._id.toString();
            if (!groupedStatuses[userId]) {
                groupedStatuses[userId] = {
                    user: status.user,
                    statuses: []
                };
            }
            
            // Map the backend model fields to the frontend expected fields
            groupedStatuses[userId].statuses.push({
                _id: status._id,
                mediaUrl: status.content, // Map content to mediaUrl
                mediaType: status.contentType, // Map contentType to mediaType
                createdAt: status.createdAt,
                viewers: status.viewers // Return full viewer objects to show who viewed
            });
        });

        // Convert the grouped object to an array
        const formattedStatuses = Object.values(groupedStatuses);

        return response(res, 200, 'Statuses retrieved successfully', formattedStatuses);
    } catch (error) {
        console.error(error);
        return response(res, 500, 'Internal server error');
    }
}


exports.viewStatus = async (req, res) => {
    const { statusId } = req.params;
    const userId = req.user.userId;
    try {
        const status = await Status.findById(statusId);
        if (!status) {
            return response(res, 404, 'Status not found')
        }
        if (!status.viewers.includes(userId)) {
            status.viewers.push(userId);
            await status.save();

            const updateStatus = await Status.findById(statusId)
                .populate('user', "username profilePicture")
                .populate('viewers', "username profilePicture");

            //Emit socket event
            if (req.io && req.socketUserMap) {
                //broadcast to all connection user except creator
                const statusOwnerSocketId = req.socketUserMap.get(status.user._id.toString());
                if (statusOwnerSocketId) {
                    const viewData = {
                        statusId,
                        viewerId: userId,
                        totalViewers: updateStatus.viewers.length,
                        viewers: updateStatus.viewers
                    }
                    req.io.to(statusOwnerSocketId).emit('status_viewed', viewData)
                } else {
                    console.log('status owner are not connected');
                }
            }


            // return response(res, 200, 'Status viewed successfully', updatedStatus);

        } else {
            console.log("user already viewed the status");
        }


        return response(res, 200, 'Status viewed successfully')
    } catch (error) {
        console.error(error)
        return response(res, 500, 'Internal server error')
    }
}


exports.deleteStatus = async (req, res) => {
    const { statusId } = req.params;
    const userId = req.user.userId;
    try {
        const status = await Status.findById(statusId);
        if (!status) {
            return response(res, 404, 'Status not found')
        } if (status.user.toString() !== userId) {
            return response(res, 403, 'Not authorized to delete this status')
        }
        await status.deleteOne();

        //Emit socket event
        if (req.io && req.socketUserMap) {
            for (const [connectedUserId, socketId] of req.socketUserMap) {
                if (connectedUserId !== userId) {
                    req.io.to(socketId).emit('status_deleted', statusId)
                }
            }
        }



        return response(res, 200, 'Status deleted successfully')
    } catch (error) {
        console.error(error)
        return response(res, 500, 'Internal server error')
    }
}