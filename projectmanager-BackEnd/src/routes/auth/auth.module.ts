import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/guard/auth.guard';

@Module({
  imports: [ JwtModule.registerAsync({
    useFactory: () => ({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '5m',
      },
    })}),
  ],

  controllers: [AuthController],

  providers: [AuthService,
    {
      provide:APP_GUARD,
      useClass:AuthGuard
    }
  ],
})
export class AuthModule {}
