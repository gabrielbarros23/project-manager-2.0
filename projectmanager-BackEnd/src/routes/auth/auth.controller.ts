import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import express from "express"
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post()
    @Public()
    async Login(
        @Res({passthrough:true}) response:express.Response,
        @Body() Credential: LoginAuthDto) {
        const data = await this.authService.login(Credential);

        response.cookie('access_token', data.token, {
            httpOnly:true,
            secure:false,
            sameSite: 'lax'
        })

        return {
            message: `Login successful ${data.userId}`,
            userId: data.userId
        }
    }

    @Post('logout')
    @Public()
    logout(@Res({passthrough:true}) response:express.Response) {
        response.clearCookie('access_token', { httpOnly: true, secure: false, sameSite: 'lax' })
        return { message: 'Logout successful' }
    }

    //deve ficar antes do @Get(':id')
    @Get('me')
    me(@Request() request) {
        return this.authService.me(request.user.sub)
    }

    @Get()
    findAll() {
        return this.authService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.authService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
        return this.authService.update(+id, updateAuthDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.authService.remove(+id);
    }
}
