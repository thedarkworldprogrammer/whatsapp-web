import React, { useEffect, useRef, useState } from 'react';
import { useStatusStore } from '../../store/useStatusStore';
import { useAuthStore } from '../../store/useAuthStore';
import { X, Plus, Camera, Trash2, ArrowLeft, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const StatusViewer = ({ onClose }) => {
    const { statuses, fetchStatuses, uploadNewStatus, markStatusAsViewed, deleteMyStatus, isStatusLoading } = useStatusStore();
    const { authUser } = useAuthStore();
    
    const [activeStatusUser, setActiveStatusUser] = useState(null);
    const [activeStatusIndex, setActiveStatusIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showViewers, setShowViewers] = useState(false);
    
    const fileInputRef = useRef(null);
    const progressIntervalRef = useRef(null);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    // Separate my status from others
    const myStatusObj = statuses.find(s => s.user?._id === authUser._id);
    const otherStatuses = statuses.filter(s => s.user?._id !== authUser._id && s.statuses.length > 0);

    // Auto progress for status viewer
    useEffect(() => {
        if (!activeStatusUser) return;

        const currentStatus = activeStatusUser.statuses[activeStatusIndex];
        
        // Mark as viewed if it's someone else's status
        if (activeStatusUser.user._id !== authUser._id) {
            markStatusAsViewed(currentStatus._id);
        }

        const DURATION = currentStatus.mediaType?.startsWith('video') ? 15000 : 5000;
        const INTERVAL = 50;
        const step = (INTERVAL / DURATION) * 100;

        setProgress(0);
        clearInterval(progressIntervalRef.current);

        progressIntervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressIntervalRef.current);
                    handleNextStatus();
                    return 100;
                }
                return prev + step;
            });
        }, INTERVAL);

        return () => clearInterval(progressIntervalRef.current);
    }, [activeStatusUser, activeStatusIndex]);

    const handleNextStatus = () => {
        if (!activeStatusUser) return;
        
        if (activeStatusIndex < activeStatusUser.statuses.length - 1) {
            setActiveStatusIndex(prev => prev + 1);
            setShowViewers(false);
        } else {
            // Find next user's status
            const currentUserIndex = otherStatuses.findIndex(s => s.user._id === activeStatusUser.user._id);
            if (currentUserIndex >= 0 && currentUserIndex < otherStatuses.length - 1) {
                setActiveStatusUser(otherStatuses[currentUserIndex + 1]);
                setActiveStatusIndex(0);
            } else {
                setActiveStatusUser(null);
            }
        }
    };

    const handlePrevStatus = () => {
        if (activeStatusIndex > 0) {
            setActiveStatusIndex(prev => prev - 1);
            setShowViewers(false);
        } else {
            const currentUserIndex = otherStatuses.findIndex(s => s.user._id === activeStatusUser.user._id);
            if (currentUserIndex > 0) {
                const prevUser = otherStatuses[currentUserIndex - 1];
                setActiveStatusUser(prevUser);
                setActiveStatusIndex(prevUser.statuses.length - 1);
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('media', file);

        try {
            await uploadNewStatus(formData);
            toast.success("Status updated!");
        } catch (error) {
            toast.error("Failed to upload status");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteStatus = async (statusId) => {
        if (window.confirm("Delete this status update?")) {
            try {
                await deleteMyStatus(statusId);
                if (activeStatusUser?.statuses.length === 1) {
                    setActiveStatusUser(null);
                } else {
                    handleNextStatus();
                }
                toast.success("Status deleted");
            } catch (error) {
                toast.error("Failed to delete status");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-[#f0f2f5] dark:bg-[#0B141A] z-50 flex transition-colors duration-200">
            {/* Left Sidebar - Status List */}
            <div className={`w-full md:w-[400px] bg-[#ffffff] dark:bg-[#111B21] border-r border-[#d1d7db] dark:border-[#2A3942] flex flex-col transition-colors duration-200 ${activeStatusUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="h-24 bg-[#f0f2f5] dark:bg-[#202C33] flex items-center px-4 transition-colors duration-200">
                    <button onClick={onClose} className="text-[#54656f] dark:text-[#AEBAC1] mr-4 hover:bg-[#e9edef] dark:hover:bg-[#2A3942] p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-medium text-[#111b21] dark:text-[#E9EDEF]">Status</h1>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* My Status */}
                    <div className="py-4 px-4">
                        <div className="flex items-center cursor-pointer group" onClick={() => myStatusObj?.statuses.length > 0 ? setActiveStatusUser(myStatusObj) : handleUploadClick()}>
                            <div className="relative mr-4">
                                {authUser.profilePicture ? (
                                    <img src={authUser.profilePicture} alt="My Status" className={`w-14 h-14 rounded-full object-cover p-[2px] ${myStatusObj?.statuses.length > 0 ? 'border-2 border-[#00A884]' : 'border-2 border-transparent'}`} />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-[#dfe5e7] dark:bg-[#6B7C85] flex items-center justify-center">
                                        <span className="text-[#111b21] dark:text-white text-xl">{authUser.username?.charAt(0)}</span>
                                    </div>
                                )}
                                
                                <div 
                                    className="absolute bottom-0 right-0 w-5 h-5 bg-[#00A884] rounded-full flex items-center justify-center border-2 border-[#ffffff] dark:border-[#111B21] hover:bg-[#008f6f]"
                                    onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                                >
                                    <Plus className="w-3 h-3 text-white" />
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
                            </div>
                            <div>
                                <h2 className="text-[#111b21] dark:text-[#E9EDEF] text-[17px] font-medium">My status</h2>
                                <p className="text-sm text-[#54656f] dark:text-[#8696A0]">
                                    {isUploading ? "Sending..." : myStatusObj?.statuses.length > 0 ? "Tap to view your status update" : "Click to add status update"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] bg-[#f2f2f2] dark:bg-[#2A3942] mx-4 mb-4 transition-colors duration-200"></div>

                    {/* Recent Updates */}
                    {otherStatuses.length > 0 && (
                        <div>
                            <div className="px-4 pb-2">
                                <h3 className="text-[#00A884] text-sm font-medium uppercase tracking-wider">Recent updates</h3>
                            </div>
                            
                            {isStatusLoading && otherStatuses.length === 0 ? (
                                <div className="p-4 text-center text-[#54656f] dark:text-[#8696A0]">Loading...</div>
                            ) : (
                                otherStatuses.map((statusUser) => {
                                    // Check if all statuses are viewed (supporting both string IDs and object references)
                                    const allViewed = statusUser.statuses.every(s => s.viewers?.some(v => v === authUser._id || v._id === authUser._id));
                                    
                                    return (
                                        <div 
                                            key={statusUser.user._id} 
                                            className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202C33] transition-colors"
                                            onClick={() => {
                                                setActiveStatusUser(statusUser);
                                                setActiveStatusIndex(0);
                                                setShowViewers(false);
                                            }}
                                        >
                                            <div className="relative mr-4">
                                                <img 
                                                    src={statusUser.user.profilePicture || "https://via.placeholder.com/150"} 
                                                    alt={statusUser.user.username} 
                                                    className={`w-14 h-14 rounded-full object-cover p-[2px] border-2 ${allViewed ? 'border-[#8696A0]' : 'border-[#00A884]'}`} 
                                                />
                                            </div>
                                            <div className="flex-1 border-b border-[#f2f2f2] dark:border-[#2A3942] pb-4 pt-1 transition-colors duration-200">
                                                <h2 className="text-[#111b21] dark:text-[#E9EDEF] text-[17px] font-medium">{statusUser.user.username}</h2>
                                                <p className="text-sm text-[#54656f] dark:text-[#8696A0]">
                                                    {new Date(statusUser.statuses[statusUser.statuses.length - 1].createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Viewer */}
            <div className={`flex-1 bg-[#222e35] dark:bg-[#0B141A] relative items-center justify-center transition-colors duration-200 ${activeStatusUser ? 'flex' : 'hidden md:flex'}`}>
                {!activeStatusUser ? (
                    <div className="text-center text-[#8696a0] flex flex-col items-center">
                        <Camera className="w-16 h-16 mb-6 text-[#8696a0] opacity-50" />
                        <h2 className="text-xl">Click on a contact to view their status updates</h2>
                    </div>
                ) : (
                    <div className="w-full max-w-lg h-[90vh] md:h-[80vh] relative bg-black rounded-lg overflow-hidden flex flex-col shadow-2xl">
                        
                        {/* Progress Bars */}
                        <div className="absolute top-0 w-full z-20 flex gap-1 p-2 bg-gradient-to-b from-black/60 to-transparent">
                            {activeStatusUser.statuses.map((_, idx) => (
                                <div key={idx} className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-white transition-all duration-[50ms] ease-linear"
                                        style={{ 
                                            width: `${idx < activeStatusIndex ? 100 : idx === activeStatusIndex ? progress : 0}%` 
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>

                        {/* Top Bar */}
                        <div className="absolute top-4 w-full z-20 flex items-center justify-between px-4">
                            <div className="flex items-center">
                                <img src={activeStatusUser.user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full mr-3 border border-white/50" />
                                <div className="text-white drop-shadow-md">
                                    <div className="font-medium text-[15px]">{activeStatusUser.user.username}</div>
                                    <div className="text-xs text-white/80">
                                        {new Date(activeStatusUser.statuses[activeStatusIndex].createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {activeStatusUser.user._id === authUser._id && (
                                    <button 
                                        onClick={() => handleDeleteStatus(activeStatusUser.statuses[activeStatusIndex]._id)}
                                        className="text-white hover:text-red-400 drop-shadow-md p-1"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => { setActiveStatusUser(null); setShowViewers(false); }} className="text-white hover:text-gray-300 drop-shadow-md p-1">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Media Content */}
                        <div className="flex-1 flex items-center justify-center bg-[#111B21] dark:bg-[#111B21] relative cursor-pointer group">
                            {/* Tap Navigation Areas */}
                            <div className="absolute left-0 top-0 w-1/3 h-full z-10" onClick={handlePrevStatus}></div>
                            <div className="absolute right-0 top-0 w-2/3 h-full z-10" onClick={handleNextStatus}></div>

                            {activeStatusUser.statuses[activeStatusIndex].mediaType?.startsWith('video') ? (
                                <video 
                                    src={activeStatusUser.statuses[activeStatusIndex].mediaUrl} 
                                    autoPlay 
                                    className="w-full h-full object-contain"
                                    onEnded={handleNextStatus}
                                />
                            ) : (
                                <img 
                                    src={activeStatusUser.statuses[activeStatusIndex].mediaUrl} 
                                    alt="Status" 
                                    className="w-full h-full object-contain"
                                />
                            )}
                            
                            {/* View Count for my own status */}
                            {activeStatusUser.user._id === authUser._id && (
                                <div className="absolute bottom-6 w-full flex flex-col items-center z-20">
                                    <div 
                                        className="inline-flex bg-black/50 hover:bg-black/70 transition-colors text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm cursor-pointer items-center gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowViewers(!showViewers);
                                        }}
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span className="font-medium">{activeStatusUser.statuses[activeStatusIndex].viewers?.length || 0}</span> Views
                                    </div>
                                </div>
                            )}

                            {/* Viewers List Bottom Sheet */}
                            {showViewers && activeStatusUser.user._id === authUser._id && (
                                <div 
                                    className="absolute bottom-0 left-0 w-full bg-[#111B21] rounded-t-2xl z-30 flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.5)] transition-transform duration-300 transform translate-y-0"
                                    style={{ maxHeight: '60%', height: 'auto', minHeight: '30%' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center justify-between p-4 border-b border-[#2A3942]">
                                        <h3 className="text-[#E9EDEF] font-medium flex items-center gap-2">
                                            <Eye className="w-5 h-5 text-[#8696A0]" />
                                            Viewed by {activeStatusUser.statuses[activeStatusIndex].viewers?.length || 0}
                                        </h3>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowViewers(false);
                                            }}
                                            className="text-[#8696A0] hover:text-[#E9EDEF] p-1"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-2 pb-4">
                                        {activeStatusUser.statuses[activeStatusIndex].viewers?.length > 0 ? (
                                            activeStatusUser.statuses[activeStatusIndex].viewers.map((viewer, idx) => (
                                                <div key={viewer._id || idx} className="flex items-center p-3 hover:bg-[#202C33] rounded-lg cursor-pointer transition-colors">
                                                    <img 
                                                        src={viewer.profilePicture || "https://via.placeholder.com/150"} 
                                                        alt={viewer.username} 
                                                        className="w-10 h-10 rounded-full object-cover mr-4 border border-[#2A3942]" 
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="text-[#E9EDEF] text-[15px] font-medium">{viewer.username}</h4>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-[#8696A0] p-6">
                                                No views yet
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusViewer;
