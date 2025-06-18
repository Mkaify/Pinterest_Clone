import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pinId } = await params;

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if pin exists
    const pin = await prisma.pin.findUnique({
      where: { id: pinId },
    });

    if (!pin) {
      return NextResponse.json({ error: "Pin not found" }, { status: 404 });
    }

    // Check if user already liked this pin
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_pinId: {
          userId: user.id,
          pinId: pinId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json({ error: "Pin already liked" }, { status: 400 });
    }

    // Create like
    await prisma.like.create({
      data: {
        userId: user.id,
        pinId: pinId,
      },
    });

    return NextResponse.json({ message: "Pin liked successfully" });
  } catch (error) {
    console.error("Error liking pin:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: pinId } = await params;

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete like
    const deletedLike = await prisma.like.deleteMany({
      where: {
        userId: user.id,
        pinId: pinId,
      },
    });

    if (deletedLike.count === 0) {
      return NextResponse.json({ error: "Like not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Pin unliked successfully" });
  } catch (error) {
    console.error("Error unliking pin:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 