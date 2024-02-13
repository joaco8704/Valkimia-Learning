import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await currentUser();

    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        isPublished: true,
      }
    });

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: params.courseId
        }
      }
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }
    
    if (purchase) {
      return new NextResponse("Already purchased", { status: 400 });
    } else {

      const newPurchase = await db.purchase.create({
        data: {
          userId: user.id,
          courseId: params.courseId,
        }
      });
      return new NextResponse("Success", { status: 200, headers: { 'Location': req.url } });
    }

    

    // let stripeCustomer = await db.stripeCustomer.findUnique({
    //   where: {
    //     userId: user.id,
    //   },
    //   select: {
    //     stripeCustomerId: true,
    //   }
    // });

    // if (!stripeCustomer) {
    //   const customer = await stripe.customers.create({
    //     email: user.emailAddresses[0].emailAddress,
    //   });

    //   stripeCustomer = await db.stripeCustomer.create({
    //     data: {
    //       userId: user.id,
    //       stripeCustomerId: customer.id,
    //     }
    //   });
    // }

    // const session = await stripe.checkout.sessions.create({
    //   customer: stripeCustomer.stripeCustomerId,
    //   line_items,
    //   mode: 'payment',
    //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?canceled=1`,
    //   metadata: {
    //     courseId: course.id,
    //     userId: user.id,
    //   }
    // });

    return new NextResponse("Success", { status: 200, headers: { 'Location': req.url } });
    
    } catch (error) {
    console.log("[COURSE_ID_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 })
  }
}