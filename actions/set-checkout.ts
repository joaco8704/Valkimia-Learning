import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const setCheckout = async ({ params }: { params: { courseId: string } }) => {
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
  
      if (purchase) {
        return new NextResponse("Already purchased", { status: 400 });
      }
  
      if (!course) {
        return new NextResponse("Not found", { status: 404 });
      }
  
      let stripeCustomer = await db.stripeCustomer.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          stripeCustomerId: true,
        }
      });
  
      if (!stripeCustomer) {
        const customer = await stripe.customers.create({
          email: user.emailAddresses[0].emailAddress,
        });
  
        stripeCustomer = await db.stripeCustomer.create({
          data: {
            userId: user.id,
            stripeCustomerId: customer.id,
          }
        });
      }
  
      // Additional logic or processing can be added here
  
    } catch (error) {
      console.error("Error in setCheckout:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };
  
  