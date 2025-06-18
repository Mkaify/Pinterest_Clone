import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";
import { uploadImage } from "@/lib/cloudinary";

// Validation schema for creating a pin
const createPinSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  imageUrl: z.string().min(1, { message: "Image is required" }),
  link: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Get all pins (with pagination and filtering)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "50");
    const query = searchParams.get("q") || "";
    const tag = searchParams.get("tag") || "";
    const userId = searchParams.get("userId") || "";
    const favorites = searchParams.get("favorites") === "true";

    const skip = (page - 1) * limit;

    // Get current user ID if logged in
    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      currentUserId = currentUser?.id || null;
    }

    // Build filter
    const filter: any = {};

    if (query) {
      filter.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (tag) {
      filter.tags = {
        has: tag,
      };
    }

    if (userId) {
      // Handle both userId (ID) and userEmail filtering
      if (userId.includes('@')) {
        // It's an email, find the user first
        const user = await prisma.user.findUnique({
          where: { email: userId },
          select: { 
            id: true, 
            profileVisibility: true,
          },
        });
        if (user) {
          // Check privacy settings - only allow if public profile, own profile, or following
          if (user.profileVisibility === 'private' && currentUserId !== user.id) {
            // Check if current user is following this user
            const isFollowing = currentUserId ? await prisma.follow.findFirst({
              where: {
                followerId: currentUserId,
                followingId: user.id,
              },
            }) : null;
            
            if (!isFollowing) {
              // Not following private user, return empty results
              filter.creatorId = "nonexistent";
            } else {
              if (favorites) {
                filter.saves = {
                  some: {
                    userId: user.id,
                  },
                };
              } else {
                filter.creatorId = user.id;
              }
            }
          } else {
            if (favorites) {
              filter.saves = {
                some: {
                  userId: user.id,
                },
              };
            } else {
              filter.creatorId = user.id;
            }
          }
        } else {
          // User not found, return empty results
          filter.creatorId = "nonexistent";
        }
      } else {
        // It's a user ID
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { 
            id: true, 
            profileVisibility: true,
          },
        });
        
        if (user) {
          // Check privacy settings
          if (user.profileVisibility === 'private' && currentUserId !== user.id) {
            const isFollowing = currentUserId ? await prisma.follow.findFirst({
              where: {
                followerId: currentUserId,
                followingId: user.id,
              },
            }) : null;
            
            if (!isFollowing) {
              filter.creatorId = "nonexistent";
            } else {
              if (favorites) {
                filter.saves = {
                  some: {
                    userId: userId,
                  },
                };
              } else {
                filter.creatorId = userId;
              }
            }
          } else {
            if (favorites) {
              filter.saves = {
                some: {
                  userId: userId,
                },
              };
            } else {
              filter.creatorId = userId;
            }
          }
        } else {
          filter.creatorId = "nonexistent";
        }
      }
    }

    // Get pins
    const pins = await prisma.pin.findMany({
      where: filter,
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
            comments: true,
            likes: true,
            saves: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Transform pins to include isLiked and isSaved status
    const transformedPins = pins.map(pin => ({
      ...pin,
      isLiked: currentUserId ? pin.likes.length > 0 : false,
      isSaved: currentUserId ? pin.saves.length > 0 : false,
      likes: undefined, // Remove the likes array from response
      saves: undefined, // Remove the saves array from response
    }));

    // Get total count
    const total = await prisma.pin.count({ where: filter });

    return NextResponse.json({
      pins: transformedPins,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting pins:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Create a new pin
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, imageUrl, link, tags = [] } = createPinSchema.parse(body);

    // Get the creator ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // If the image is a base64 string, upload it to Cloudinary
    let finalImageUrl = imageUrl;
    if (imageUrl.startsWith("data:image")) {
      const uploadResult = await uploadImage(imageUrl);
      finalImageUrl = uploadResult.url;
    }

    // Create pin
    const pin = await prisma.pin.create({
      data: {
        title,
        description,
        imageUrl: finalImageUrl,
        link,
        tags,
        creatorId: user.id,
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
      },
    });

    return NextResponse.json(pin, { status: 201 });
  } catch (error) {
    console.error("Error creating pin:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
