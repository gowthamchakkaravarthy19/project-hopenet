import { useEffect } from 'react';
import { HiOutlineX, HiExclamation, HiOutlineCheckCircle, HiOutlineInformationCircle } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const variants = {
        danger: { bg: 'bg-red-100', iconColor: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700', Icon: HiExclamation },
        warning: { bg: 'bg-amber-100', iconColor: 'text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700', Icon: HiExclamation },
        success: { bg: 'bg-green-100', iconColor: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700', Icon: HiOutlineCheckCircle },
        primary: { bg: 'bg-primary-100', iconColor: 'text-primary-600', btn: 'bg-primary-600 hover:bg-primary-700', Icon: HiOutlineInformationCircle },
    };
    const c = variants[variant] || variants.danger;
    const IconComponent = c.Icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <HiOutlineX className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-14 h-14 ${c.bg} rounded-full flex items-center justify-center mb-4`}>
                        <IconComponent className={`w-7 h-7 ${c.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                    {message && <p className="text-gray-500 mb-6">{message}</p>}
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                        <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white ${c.btn} transition-colors`}>
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
