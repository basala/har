import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ExecutionType {
    Project = 1,
    Account = 2,
    Issue = 3,
}

export class ExecutionDto {
    @IsNotEmpty()
    @IsEnum(ExecutionType)
    type: ExecutionType;

    @IsString()
    @IsOptional()
    robot?: string;
}
