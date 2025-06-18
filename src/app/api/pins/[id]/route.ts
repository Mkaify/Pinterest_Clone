import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Pin ID is required" },
        { status: 400 }
      );
    }

    // Get current user ID if logged in
    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      currentUserId = currentUser?.id || null;
    }

    const pin = await prisma.pin.findUnique({
      where: {
        id: id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        likes: currentUserId ? {
          where: {
            userId: currentUserId,
          },
          select: {
            userId: true,
          },
        } : false,
        saves: currentUserId ? {
          where: {
            userId: currentUserId,
          },
          select: {
            userId: true,
          },
        } : false,
        _count: {
          select: {
            likes: true,
            saves: true,
            comments: true,
          },
        },
      },
    });

    if (!pin) {
      return NextResponse.json(
        { error: "Pin not found" },
        { status: 404 }
      );
    }

    // Transform pin to include isLiked and isSaved status
    const transformedPin = {
      ...pin,
      isLiked: currentUserId ? pin.likes.length > 0 : false,
      isSaved: currentUserId ? pin.saves.length > 0 : false,
      likes: undefined, // Remove the likes array from response
      saves: undefined, // Remove the saves array from response
    };

    return NextResponse.json(transformedPin);
  } catch (error) {
    console.error("Error fetching pin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 