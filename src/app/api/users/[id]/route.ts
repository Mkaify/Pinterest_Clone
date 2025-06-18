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
        { error: "User ID is required" },
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

    // Get the requested user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        profileVisibility: true,
        activityVisibility: true,
        createdAt: true,
        _count: {
          select: {
            pins: true,
            followers: true,
            following: true,
          },
        },
        followers: currentUserId ? {
          where: {
            followerId: currentUserId,
          },
          select: {
            id: true,
          },
        } : false,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if current user can view this profile
    const isOwnProfile = currentUserId === user.id;
    const isFollowing = currentUserId ? user.followers.length > 0 : false;
    
    // If profile is private and user is not following or is not the owner
    if (user.profileVisibility === "private" && !isOwnProfile && !isFollowing) {
      return NextResponse.json({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        profileVisibility: user.profileVisibility,
        isPrivate: true,
        isFollowing: false,
        _count: {
          followers: user._count.followers,
          following: user._count.following,
          pins: 0, // Don't show pin count for private profiles
        },
      });
    }

    // Return full profile data
    return NextResponse.json({
      ...user,
      isFollowing: currentUserId ? user.followers.length > 0 : false,
      isOwnProfile,
      isPrivate: false,
      followers: undefined, // Remove the raw followers data
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 