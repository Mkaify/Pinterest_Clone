import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [], total: 0, totalPages: 0, currentPage: page });
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

    // Search for users with searchVisibility enabled
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            searchVisibility: true, // Only show users who allow search
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                username: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        profileVisibility: true,
        _count: {
          select: {
            pins: true,
            followers: true,
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
      orderBy: [
        {
          name: "asc",
        },
      ],
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.user.count({
      where: {
        AND: [
          {
            searchVisibility: true,
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                username: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
    });

    const totalPages = Math.ceil(total / limit);

    // Transform the data to include follow status
    const transformedUsers = users.map(user => ({
      ...user,
      isFollowing: currentUserId ? user.followers.length > 0 : false,
      followers: undefined, // Remove the raw followers data
    }));

    return NextResponse.json({
      users: transformedUsers,
      total,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 