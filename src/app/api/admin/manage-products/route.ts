import connectDB from "@/config/db/connectDB";
import Product from "@/models/product.model/product.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession();
    const user = session?.user;

    // Uncomment this if you want to enforce authentication
    if (!user) {
      return NextResponse.json(
        {
          status: 401,
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1); // Default to 1, min 1
    const limit = Math.max(parseInt(searchParams.get("limit") || ""));

    // Fetch products with pagination and sorting
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Construct the response
    const response = {
      status: 200,
      success: true,
      message: "Products retrieved successfully",
      data: products,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        status: 500,
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession();
    const user = session?.user;

    // Uncomment this if you want to enforce authentication
    if (!user) {
      return NextResponse.json(
        {
          status: 401,
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { status, productId } = await req.json();

    // Fetch products with pagination and sorting
    const products = await Product.findOne({ _id: productId });

    products.status = status;

    await products.save();

    console.log(products);
    // Construct the response
    const response = {
      status: 200,
      success: true,
      message: "Products retrieved successfully",
      data: products,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        status: 500,
        success: false,
        message: "Something went wrong",
        error: error,
      },
      { status: 500 }
    );
  }
}
