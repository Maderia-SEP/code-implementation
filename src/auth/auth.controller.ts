import { Body, Controller, Delete, Get, Post, Redirect, Render, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  HotelSignInDto,
  HotelSignupDto,
  HotelUpdateDto,
  PasswordResetDto,
  UserSignInDto,
  UserSignupDto,
  UserUpdateDto,
} from './dto';
import { JwtGuard } from './jwt.guard';

/**
 * The controller class for the Auth module. This class handles endpoints related
 * to authentication logic: the user-sign-up, hotel-sign-up
 */
@Controller('auth')
export class AuthController {
  /**
   * @param authService we inject the AuthService class in the AuthController
   */
  constructor(private authService: AuthService) {}

  /**
   * A controller method to service requests from new users to sign up.
   * The data passed to the method is already validated via guards in the UserAuthDto class.
   * The dto validation mechanism throws errors with appropriate error messages and codes when
   * validation of the dto fails.
   * Currently, all this controller does is call the userSignUp service, passing the dto.
   * @param dto Instance of the UserAuthDto class is passed to this method after the
   * post data gets validated.
   */
  @Post('userSignup')
  @Redirect()
  async userSignup(@Body() dto: UserSignupDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.userSignup(dto);
    // we set a cookie in the response object that will be saved in the browser and
    // sent back with every relevant request. (now the client is logged in)
    res.cookie('token', token)
    // if sign-up is successful, we redirect to the index page.
    return {url: '/client/index'}
  }

  /**
   * Another controller method to service sign up requests from new hotels.
   * The data passed to the method is already validated via guards in the UserAuthDto class.
   * The dto validation mechanism throws errors with appropriate error messages and codes when
   * validation of the dto fails.
   * Currently, all this controller does is call the hotelSignUp service, passing the dto.
   * @param dto Instance of the UserAuthDto class is passed to this method after the post
   * data gets validated.
   */
  @Post('hotelSignup')
  @Redirect()
  async hotelSignup(@Body() dto: HotelSignupDto, @Res({ passthrough: true}) res: Response) {
    const token = await this.authService.hotelSignup(dto)
    // we set a cookie in the response object that will be saved in the browser and
    // sent back with every relevant request. (now the client is logged in)
    res.cookie('token', token)
    // if sign-up is successful, we redirect to the index page.
    return {url: '/client/index'}
  }


  @Post('hotelSignIn')
  @Redirect()
  async hotelSignIn(@Body() dto: HotelSignInDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.hotelSignIn(dto)
    // we set a cookie in the response object that will be saved in the browser and
    // sent back with every relevant request. (now the client is logged in)
    res.cookie('token', token)
    // if sign-in is successful, we redirect to the index page.
    return {url: '/client/index'}
  }

  @Post('userSignIn')
  @Redirect()
  async userSignIn(@Body() dto: UserSignInDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.userSignIn(dto)
    // we set a cookie in the response object that will be saved in the browser and
    // sent back with every relevant request. (now the client is logged in)
    res.cookie('token', token)
    // if sign-in is successful, we redirect to the index page.
    return {url: '/client/index'}
  }

  @Get('signout')
  @Redirect()
  logout(@Res( { passthrough: true }) res: Response) {
    res.cookie('token', '')
    // apon signing out, we redirect to the front page.
    return {url: '/'}
  }

  @Get('signin')
  @Render('sign_in')
  signInPage(){
    return {}
  }

  @Get('signup')
  @Render('sign_up')
  signUpPage(){
    return {}
  }


  @Delete('deleteUser')
  @Redirect()
  @UseGuards(JwtGuard)
  async deleteUser(@Req() req:any, @Res( { passthrough: true }) res: Response) {
    const deletedUser = await this.authService.deleteUser(req.user.id)
    // we also need to sign the user out.
    res.cookie('token', '')
    // then redirect to the front page
    return {url: '/'}
  }

  @Delete('deleteHotel')
  @UseGuards(JwtGuard)
  async deleteHotel(@Req() req:any) {
    const deletedHotel = await this.authService.deleteHotel(req.user.id)
    return {user: deletedHotel}
  }

  /**
   * This controller handles updating of profile information for users.
   * @param req the request objext will be passed to the controller method (by the freamwork)
   * @param newUserInfo this instance of UserUpdateDto will contain the new user_name, email, and full_name of the user
   * that should go in place of (replace) the old ones.
   * @returns returns the newly updated user object.
   */
  @Post('userUpdate')
  @Redirect()
  @UseGuards(JwtGuard)
  async updateUser(@Req() req:any, @Body() newUserInfo: UserUpdateDto) {
    const updatedUser = await this.authService.updateUser(req.user.id, newUserInfo)
    return {url: '/auth/profile'}
  }

  @Post('hotelUpdate')
  @Redirect()
  @UseGuards(JwtGuard)
  async updateHotel(@Req() req:any, @Body() newHotelInfo: HotelUpdateDto) {
    const updatedHotel = await this.authService.updateHotel(req.user.id, newHotelInfo)
    return {url: '/auth/profile'}
  }

  /**
   * This simple controller accepts Get requests for the profile pages, checks if it's a user or a hotel
   * requesting the profile page and responds by rendering different templates based on the client type.
   * @param req the freamwork passes the request object
   * @param res the freamwork passes the response object
   * @returns returning res.render() signals hadlebars to render a template and pass arguments to it.
   */
  @Get('profile')
  @UseGuards(JwtGuard)
  profile(@Req() req:any, @Res() res: Response) {
    const client = req.user
    // this is how we know if the client is a user or a hotel. we check for the 'full_name' field.
    if(client.full_name) {
      // this return signals hadlebars (the template engine) to render the specified template.
      return res.render('user_profile', {'user': client})
    } else {
      // here again, we're rendering a template.
      return res.render('hotel_profile', {'hotel': client})
    }
  }

  /**
   * This controller handles password reset for users.
   * @param req the request object will be passed to the controller method (by the freamwork)
   * @param passwordInfo this instanceo of PasswordResetDto contains the old password (for verification purposes)
   * and the new password that should replace the old one.
   * @returns the user object whose password has now been changed.
   */
  @Post('userPasswordReset')
  @Redirect()
  @UseGuards(JwtGuard)
  async changeUserPassword(@Req() req:any, @Body() passwordInfo: PasswordResetDto) {
    const user = await this.authService.changeUserPassword(req.user.id, passwordInfo)
    return {url: '/auth/profile'}
  }

  /**
   * This controller handles password reset for hotels.
   * @param req the request object will be passed to the controller method (by the freamwork)
   * @param passwordInfo this instance of PasswordResetDto contains the old password (for verification purposes)
   * and the new password that should replace the old one.
   * @returns the hotel object whose password has now been changed.
   */
  @Post('hotelPasswordReset')
  @Redirect()
  @UseGuards(JwtGuard)
  async changeHotelPassword(@Req() req:any, @Body() passwordInfo: PasswordResetDto) {
    const hotel = await this.authService.changeHotelPassword(req.user.id, passwordInfo)
    return {url: '/auth/profile'}
  }
}


