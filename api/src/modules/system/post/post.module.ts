import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostEntity } from "./entities/post.entity";
import { PostService } from "./post.service";
import { PostController } from "./post.controller";

@Module({
    imports: [TypeOrmModule.forFeature([PostEntity])],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService],
})

export class PostModule { }