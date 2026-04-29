import React from 'react';

const NoChatSelected = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#222E35] border-b-[6px] border-[#00a884] dark:border-[#00A884] text-center px-4 relative h-full transition-colors duration-200">
            <div className="max-w-[460px]">
                <img 
                    src="/whatsapp_image.png" 
                    alt="WhatsApp Web" 
                    className="w-[320px] h-[320px] object-contain mx-auto mb-8 opacity-90"
                />
                
                <h1 className="text-[32px] font-light text-[#41525d] dark:text-[#E9EDEF] mb-4 mt-8 transition-colors duration-200">
                    WhatsApp Web
                </h1>
                
                <p className="text-[#667781] dark:text-[#8696A0] text-[14px] leading-6 mb-8 transition-colors duration-200">
                    Send and receive messages without keeping your phone online.<br/>
                    Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
                </p>
            </div>
            
            <div className="absolute bottom-10 flex items-center justify-center text-[#667781] dark:text-[#8696A0] text-sm transition-colors duration-200">
                <svg viewBox="0 0 10 12" height="12" width="10" preserveAspectRatio="xMidYMid meet" className="text-[#667781] dark:text-[#8696A0] mr-1.5" version="1.1" x="0px" y="0px" enableBackground="new 0 0 10 12"><path fill="currentColor" d="M5,0.066L0,2.399v3.52c0,3.311,2.128,6.417,5,7.185c2.872-0.768,5-3.873,5-7.185v-3.52 L5,0.066z M4.316,8.813L2.235,6.721l0.697-0.706l1.385,1.385l3.181-3.212l0.706,0.706L4.316,8.813z"></path></svg>
                <span>Your personal messages are end-to-end encrypted</span>
            </div>
        </div>
    );
};

export default NoChatSelected;
