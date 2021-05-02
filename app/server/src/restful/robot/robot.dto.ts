import { IsNotEmpty, IsString } from 'class-validator';

export class TestConnectionDto {
    @IsNotEmpty()
    @IsString()
    readonly webhook: string;

    @IsNotEmpty()
    @IsString({ each: true })
    readonly mentioned_list: string[];
}
