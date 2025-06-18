import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { deleteImage } from "@/lib/cloudinary";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with all related data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        pins: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user profile image from Cloudinary if exists
    if (user.image && !user.image.includes("demo-image")) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = user.image.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split(".")[0];
        await deleteImage(`profile-images/${publicId}`);
      } catch (error) {
        console.warn("Failed to delete profile image:", error);
      }
    }

    // Delete pin images from Cloudinary
    for (const pin of user.pins) {
      if (pin.imageUrl && !pin.imageUrl.includes("demo-image")) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = pin.imageUrl.split("/");
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split(".")[0];
          await deleteImage(`pinterest-clone/${publicId}`);
        } catch (error) {
          console.warn("Failed to delete pin image:", error);
        }
      }
    }

    // Delete user and all related data (cascade deletes will handle the rest)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 