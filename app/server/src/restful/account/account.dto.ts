import { IsNotEmpty, IsString } from 'class-validator';

export class TestConnectionDto {
    @IsNotEmpty()
    @IsString()
    readonly projectId: string;

    @IsNotEmpty()
    @IsString()
    readonly username: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;
}
