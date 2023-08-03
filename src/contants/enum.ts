export enum UserVerifyStatus {
  Unverified,
  Verified, 
  Banned
}

export enum TokenType{
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video
}

export enum StatusAudience {
  Everyone, // 0
  Private // 1
}

export enum StatusTypeEnum{
  Status,
  Restatus,
  Comment
}