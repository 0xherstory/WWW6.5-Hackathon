import { Router } from 'express';
import { AuthController, upload } from '../controllers/auth.controller';

const authRouter = Router();

authRouter.post(
  '/sign', // 👈 只改了这行！submit-offer → sign
  upload.single('offer'),
  AuthController.submitOffer
);

export default authRouter;

//G的修改理由：
//现在 auth.controller.ts 已经收敛成 submitOffer 单一路径了，那 routes 也应该同步收敛。
//否则会出现“路由暴露的是旧接口，controller 保留的是新逻辑”的错位。
// 现在真实跑通的是：
// 上传 offer 图片
// 传钱包地址
// 后端签发 credential
// 前端继续铸造 SBT
// 所以路由层就应该只暴露这条当前主链路。


// import { Router } from 'express';
// import { AuthController } from '../controllers/auth.controller';
// import { validateMiddleware } from '../middlewares/validate.middleware';
// import { z } from 'zod';
// import { emailSchema, otpSchema } from '../utils/validator.util';

// const authRouter = Router();

// // 发送OTP验证码
// authRouter.post(
//   '/send-otp',
//   validateMiddleware(z.object({ body: z.object({ email: emailSchema }) })),
//   AuthController.sendOTP
// );

// // 验证OTP验证码
// authRouter.post(
//   '/verify-otp',
//   validateMiddleware(z.object({ body: z.object({ email: emailSchema, otpCode: otpSchema }) })),
//   AuthController.verifyOTP
// );

// // OCR识别Offer Letter
// authRouter.post(
//   '/ocr-offer',
//   AuthController.ocrOfferLetter
// );

// export default authRouter;
