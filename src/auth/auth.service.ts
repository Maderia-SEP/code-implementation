import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  HotelSignInDto,
  HotelSignupDto,
  UserSignInDto,
  UserSignupDto,
} from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { hotel, user } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

export enum ClientType {
  user,
  hotel,
}

/**
 * The AuthService class is where most of the authentication logic goes in. This
 * includes writing data to and reading data from the database. It has methods
 * to sign up a user/hotel, sign in a user/hotel and delete user/hotel accounts.
 */
@Injectable()
export class AuthService {
  /**
   * We will use the PrismaService class to talk to the database, so it gets injected here. read about "dependency injection" for more.
   * @param prisma An instance of PrismaService gets passed to the constructor. This class extends the PrismaClient class that comes with prisma. It has all the necessary methods to talk to the database.
   */
  constructor(private prisma: PrismaService, private jwt: JwtService) {
  }

  /**
   * This method takes a valid UserAuthDto object and writes it to the database as a new user instance.
   * Before saving the data to database, we hash the plain password using the "argon" utility. Argon hashes
   * strings asynchronously, so this method is also asynchronous. A try-catch block will try to write to the
   * database. If the database write fails for unique constraint violations, the PrismaService will throw
   * appropriate errors. Currently, we catch those errors and throw them back, but what we actually need to do
   * is return the signup html template with an error message. Additionally, now we're returning a user object
   * upon successful signup. In future iterations, we should generate a JWT (Json Web Token), return that, and
   * redirect to the index page.
   * @param dto This is instance of the UserAuthDto (Data Transfer Object) that's received by a controller.
   * we know it is valid data because it has passed through nest guards.
   */
  async userSignup(dto: UserSignupDto) {
    //Generate password Hash for the user password
    const hash = await argon.hash(dto.password);
    // save the new user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          full_name: dto.full_name,
          user_name: dto.user_name,
          password_hash: hash.trim(),
          email: dto.email,
        },
      });
      // here, we're returning a token (jwt) as soon as users register.
      // this means that users automatically sign in as they sign up.
      // @ts-ignore
      return await this.signToken(user.id, user.email, ClientType.user);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            `the ${error.meta.target} credential has been taken`,
          );
        }
      }
      throw error;
    }
  }

  /**
   * This method takes a valid HotelAuthDto object and writes it to the database
   * as a new hotel instance. Before saving the data to database, we hash the plain
   * password using the “argon” utility. Argon hashes strings asynchronously, so
   * this method is also asynchronous. A try-catch block will try to write to the
   * database. If the database write fails for unique constraint violations, the
   * PrismaService will throw appropriate errors. Currently, we catch those errors
   * and throw them back, but what we actually need to do is return the signup html
   * template with an error message. Additionally, now we're returning a user object
   * upon successful signup. In future iterations, we should generate a JWT (Json Web Token),
   * return that, and redirect to the index page.
   * @param dto This is instance of the UserAuthDto (Data Transfer Object) that's
   * received by a controller. we know it is valid data because it has passed through
   * nest guards.
   */
  async hotelSignup(dto: HotelSignupDto) {
    //Generate password Hash for the user password
    const hash = await argon.hash(dto.password);
    //  save the user(hotel) in db

    try {
      const hotel = await this.prisma.hotel.create({
        data: {
          hotel_name: dto.hotel_name,
          user_name: dto.user_name,
          password_hash: hash.trim(),
          email: dto.email,
        },
      });
      // we sign and return a token upon successful sign-up
      // @ts-ignore
      return await this.signToken(hotel.id, hotel.email, ClientType.hotel);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            `the ${error.meta.target} credential has been taken`,
          );
        }
      }
      throw error;
    }
  }

  async userSignIn(dto: UserSignInDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      // throw Error('the email is not registered.')
      throw new HttpException(
        'the email is not registered',
        HttpStatus.FORBIDDEN,
      );
    }
    const passwordCorrect = await argon.verify(
      user.password_hash,
      dto.password,
    );
    if (passwordCorrect) {
      // we sign and return a token upon successful sign-in
      return await this.signToken(user.id, user.email, ClientType.user);
    }
    throw new HttpException('wrong password', HttpStatus.FORBIDDEN);
  }

  async hotelSignIn(dto: HotelSignInDto) {
    const hotel = await this.prisma.hotel.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!hotel) {
      throw new HttpException(
        'the email is not registered',
        HttpStatus.FORBIDDEN,
      );
    }
    const passwordCorrect = await argon.verify(
      hotel.password_hash,
      dto.password,
    );
    if (passwordCorrect) {
      // we sign and return a jwt upon successful sign-in
      return await this.signToken(hotel.id, hotel.email, ClientType.hotel);
    }
    throw new HttpException('wrong password', HttpStatus.FORBIDDEN);
  }

  // delete user function first checks if there is a row with given id in our database.if there is a value with the given id, it will be deleted, if not it will return null
  async deleteUser(id: string): Promise<user> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: +id,
      },
    });
    if (!user) {
      throw new ForbiddenException('invalid credentials');
    }
    const deletedUser = await this.prisma.user.delete({ where: { id: +id } });
    delete deletedUser.password_hash;
    return deletedUser;
  }

  // deleteHotel function first checks if there is a row with given id in our database.if there is a value with the given id, it will be deleted, if not it will return null
  async deleteHotel(id: string): Promise<hotel> {
    const hotel = await this.prisma.hotel.findUnique({
      where: {
        id: +id,
      },
    });
    if (!hotel) {
      throw new ForbiddenException('invalid credentials');
    }
    const deletedHotel = await this.prisma.hotel.delete({ where: { id: +id } });
    delete deletedHotel.password_hash;
    return deletedHotel;
  }

  async signToken(
    id: number,
    email: string,
    clientType: ClientType,
  ): Promise<{ access_token: string }> {
    const tokenData = {
      // 'sub' means id. (it's a convention in the jwt environment)
      sub: id,
      email: email,
      client_type: clientType,
    };
    const token = this.jwt.signAsync(tokenData, {
      //TODO: change the expiration time to make it realistic.
      expiresIn: '1h',
      //TODO: pass the secret string with environment variables.
      secret: 'the way we do things',
    });
    return {
      access_token: await token,
    };
  }
}
