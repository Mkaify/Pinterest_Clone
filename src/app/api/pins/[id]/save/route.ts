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

    // Check if user already saved this pin
    const existingSave = await prisma.save.findUnique({
      where: {
        userId_pinId: {
          userId: user.id,
          pinId: pinId,
        },
      },
    });

    if (existingSave) {
      return NextResponse.json({ error: "Pin already saved" }, { status: 400 });
    }

    // Create save
    await prisma.save.create({
      data: {
        userId: user.id,
        pinId: pinId,
      },
    });

    return NextResponse.json({ message: "Pin saved successfully" });
  } catch (error) {
    console.error("Error saving pin:", error);
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

    // Delete save
    const deletedSave = await prisma.save.deleteMany({
      where: {
        userId: user.id,
        pinId: pinId,
      },
    });

    if (deletedSave.count === 0) {
      return NextResponse.json({ error: "Save not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Pin unsaved successfully" });
  } catch (error) {
    console.error("Error unsaving pin:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 