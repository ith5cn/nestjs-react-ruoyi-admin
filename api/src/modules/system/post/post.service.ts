import { Injectable } from "@nestjs/common";
import { PostEntity } from "./entities/post.entity";
import { BaseService } from "@/common/services/base.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class PostService extends BaseService<PostEntity> {
    constructor(
        @InjectRepository(PostEntity)
        private readonly postRepository: Repository<PostEntity>,
    ) {
        super(postRepository);
    }
}
