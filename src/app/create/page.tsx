"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function CreatePinPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-4xl px-4 py-8 mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-4xl px-4 py-8 mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to create a pin</h1>
            <Link 
              href="/auth/login"
              className="px-6 py-2 text-white bg-red-600 rounded-full hover:bg-red-700"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0];
      setUploadedImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    multiple: false,
  });

  const resetImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setUploadedImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedImage) {
      toast.error("Please upload an image");
      return;
    }

    if (!title) {
      toast.error("Please add a title");
      return;
    }

    setIsLoading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const imageBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(uploadedImage);
      });

      // Create pin via API
      const response = await fetch("/api/pins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl: imageBase64,
          link,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error:", response.status, errorData);
        throw new Error(`Failed to create pin: ${response.status} ${errorData}`);
      }

      toast.success("Pin created successfully!");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center">Create Pin</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Image Upload */}
          <div className="space-y-4">
            {!preview ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400'}`}
              >
                <input {...getInputProps()} />
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-2 font-medium">Drag and drop an image here, or click to select a file</p>
                <p className="text-sm text-gray-500">Recommended: Use high-quality .jpg files less than 20MB</p>
              </div>
            ) : (
              <div className="relative">
                <div className="relative overflow-hidden rounded-lg aspect-[4/5]">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={resetImage}
                  className="absolute p-1 text-white bg-gray-800 rounded-full top-2 right-2 hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Pin Details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block mb-1 font-medium">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Add a title to your pin"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-1 font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Tell everyone what your pin is about"
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="link" className="block mb-1 font-medium">
                Link
              </label>
              <input
                type="url"
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Add a link to your pin (optional)"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center px-6 py-2 font-medium text-white bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="mr-2">Creating...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                <span>Create Pin</span>
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
