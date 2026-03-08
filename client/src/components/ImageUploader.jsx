import { useState, useCallback } from 'react';
import { HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';

const ImageUploader = ({ images, setImages, maxImages = 4 }) => {
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = useCallback((files) => {
        const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
        const remaining = maxImages - images.length;
        const toAdd = newFiles.slice(0, remaining);
        setImages((prev) => [...prev, ...toAdd]);
    }, [images.length, maxImages, setImages]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    }, []);

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            {/* Drag and drop area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                onClick={() => {
                    if (images.length < maxImages) {
                        document.getElementById('image-upload-input').click();
                    }
                }}
            >
                <HiOutlinePhotograph className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">
                    Drag & drop images here, or <span className="text-primary-600">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {images.length}/{maxImages} images • JPG, PNG, WEBP up to 5MB
                </p>
                <input
                    id="image-upload-input"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {/* Preview grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                            <img
                                src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                            >
                                <HiOutlineX className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
