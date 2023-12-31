import { Router } from 'express'
import { changePasswordController, emailVerifyController, followController, forgotPasswordController, getAllUsersController, getFollowersController, getFollowingsController, getProfileController, getUserController, loginController, logoutController, oauthController, registerController, resendVerifyEmailController, resetPasswordController, unfollowController, updateProfileUserController, verifyForgotPasswordTokenController } from '~/controllers/user.controllers'
import { accessToken_validator, changePasswordValidator, emailVerifyTokenValidator, followValidator, forgotPasswordValidator, loginValidator, refreshTokenValidator, registerValidator, resetPasswordValidator, unfollowValidator, updateProfileValidator, userIdValidator, verifiedUserValidator, verifyforgotPasswordTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

const userRouter = Router()

userRouter.post('/login', validate(loginValidator), wrapRequestHandler(loginController))
userRouter.post('/register', validate(registerValidator),wrapRequestHandler(registerController))
userRouter.post('/logout',accessToken_validator, refreshTokenValidator, wrapRequestHandler(logoutController))
userRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))
userRouter.post('/resend-verify-email',accessToken_validator, wrapRequestHandler(resendVerifyEmailController))
userRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
userRouter.post('/verify-forgot-password', verifyforgotPasswordTokenValidator, wrapRequestHandler(verifyForgotPasswordTokenController))
userRouter.post('/reset-password', resetPasswordValidator, verifyforgotPasswordTokenValidator,wrapRequestHandler(resetPasswordController))
userRouter.get('/get-profile', accessToken_validator,wrapRequestHandler(getProfileController))
userRouter.get('/get-suggest-user', wrapRequestHandler(getAllUsersController))
userRouter.patch('/update-user-infor', accessToken_validator, wrapRequestHandler(verifiedUserValidator), updateProfileValidator,wrapRequestHandler(updateProfileUserController))
userRouter.put('/change-password',accessToken_validator, wrapRequestHandler(verifiedUserValidator), changePasswordValidator, wrapRequestHandler(changePasswordController))
userRouter.get('/:id', wrapRequestHandler(getUserController))
userRouter.post('/follow', accessToken_validator, wrapRequestHandler(verifiedUserValidator),followValidator, wrapRequestHandler(followController))
userRouter.delete('/follow/:user_id', accessToken_validator, wrapRequestHandler(verifiedUserValidator),unfollowValidator, wrapRequestHandler(unfollowController))
userRouter.get('/oauth/google', wrapRequestHandler(oauthController))
userRouter.get('/follower/:user_id', accessToken_validator, verifiedUserValidator,userIdValidator, wrapRequestHandler(getFollowersController))
userRouter.get('/following/:user_id', accessToken_validator, verifiedUserValidator,userIdValidator, wrapRequestHandler(getFollowingsController))
userRouter.post('/refresh_token', refreshTokenValidator, wrapRequestHandler(loginController))

export default userRouter
