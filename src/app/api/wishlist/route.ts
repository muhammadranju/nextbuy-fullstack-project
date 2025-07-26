import connectDB from "@/config/db/connectDB";
import Wishlist, {
  IWishlist,
  IWishlistItem,
} from "@/models/wishlist.model/wishlist.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface WishlistRequestBody {
  userEmail: string;
  productId: string;
  items: {
    productId: string;
  };
}

interface WishlistResponse {
  status: number;
  success: boolean;
  message: string;
  data?: IWishlist;
}

export async function POST(
  req: Request
): Promise<NextResponse<WishlistResponse>> {
  try {
    await connectDB();
    const session = await getServerSession();
    const user = session?.user;

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

    const { userEmail, items }: WishlistRequestBody = await req.json();

    if (!userEmail || !items || !items.productId) {
      return NextResponse.json(
        {
          status: 400,
          success: false,
          message: "All fields (userEmail, productId) are required",
        },
        { status: 400 }
      );
    }

    // Check if wishlist already exists for this user
    let wishlist: IWishlist | null = await Wishlist.findOne({ userEmail });

    if (wishlist) {
      // Wishlist exists, check if product already in wishlist
      const existingItemIndex = wishlist.items.findIndex(
        (item: IWishlistItem) => item.productId.toString() === items.productId
      );

      if (existingItemIndex > -1) {
        return NextResponse.json(
          {
            status: 200,
            success: true,
            message: "Product already in wishlist",
            data: wishlist,
          },
          { status: 200 }
        );
      } else {
        wishlist.items.push({
          productId: items.productId,
          addedAt: new Date(),
        });
        await wishlist.save();
      }
    } else {
      // Create new wishlist if it doesn't exist
      const newWishlist = new Wishlist({
        userEmail,
        items: [
          {
            productId: items.productId,
            addedAt: new Date(),
          },
        ],
      });
      await newWishlist.save();
      wishlist = newWishlist; // Assign the new wishlist to the variable
    }

    // At this point, wishlist is guaranteed to be non-null
    return NextResponse.json(
      {
        status: 201,
        success: true,
        message: wishlist!.isNew
          ? "Wishlist created successfully"
          : "Product added to wishlist successfully",
        data: wishlist!,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error in wishlist controller:", error);
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

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession();
    const user = session?.user;

    // if (!user) {
    //   return NextResponse.json(
    //     {
    //       status: 401,
    //       success: false,
    //       message: "Unauthorized",
    //     },
    //     { status: 401 }
    //   );
    // }

    // Parse the URL
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail") || "";

    const wishlist = await Wishlist.findOne({
      userEmail,
    })
      .populate({
        path: "items.productId",
        model: "Product", // Ensure this matches your Product model name
      })
      .exec();

    if (!wishlist) {
      return NextResponse.json(
        {
          status: 404,
          success: false,
          message: "Wishlist not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: 200,
        success: true,
        message: "Wishlist fetched successfully",
        data: wishlist,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching Wishlist:", error);
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

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession();
    const user = session?.user;

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

    const { userEmail, productId }: WishlistRequestBody = await req.json();

    if (!userEmail || !productId) {
      return NextResponse.json(
        {
          status: 400,
          success: false,
          message: "All fields (userEmail, productId) are required",
        },
        { status: 400 }
      );
    }

    // Check if wishlist exists for this user
    const wishlist: IWishlist | null = await Wishlist.findOne({ userEmail });

    if (!wishlist) {
      return NextResponse.json(
        {
          status: 404,
          success: false,
          message: "Wishlist not found",
        },
        { status: 404 }
      );
    }

    // Check if product exists in wishlist
    const existingItemIndex = wishlist.items.findIndex(
      (item: IWishlistItem) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Product exists in wishlist, remove it
      wishlist.items.splice(existingItemIndex, 1);
      await wishlist.save();

      return NextResponse.json(
        {
          status: 200,
          success: true,
          message: "Product removed from wishlist",
          data: wishlist,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: 404,
          success: false,
          message: "Product not found in wishlist",
        },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    console.error("Error in wishlist controller:", error);
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
