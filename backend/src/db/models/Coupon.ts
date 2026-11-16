import { Schema, model, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountPercent: number;
  active: boolean;
  expiresAt?: Date;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, unique: true, required: true },
  discountPercent: { type: Number, required: true },
  active: { type: Boolean, default: true },
  expiresAt: Date,
});

export const Coupon = model<ICoupon>('Coupon', CouponSchema);
