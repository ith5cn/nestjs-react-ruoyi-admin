import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthSystemLoginDto, AuthSystemRefreshTokenDto, AuthSystemRegisterDto } from "./dto/auth-system.dto";
import { Public } from "@/common/decorators/public.decorator";


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * 系统登录
     * @param AuthSystemLoginDto 
     * @returns 
     */
    @Public()
    @Post('system/login')
    async systemLogin(@Body() loginDto: AuthSystemLoginDto) {
        let username = loginDto.username || '';
        let password = loginDto.password || '';
        return this.authService.systemLogin({ username, password });
    }

    /**
     * 系统刷新token
     */
    @Public()
    @Post('system/refresh-token')
    async systemRefreshToken(@Body() refreshTokenDto: AuthSystemRefreshTokenDto) {
        return this.authService.systemRefreshToken(refreshTokenDto);
    }

    /**
     * 系统注册
     */
    @Public()
    @Post('system/register')
    async systemRegister(@Body() registerDto: AuthSystemRegisterDto) {
        return this.authService.systemRegister(registerDto);
    }
}