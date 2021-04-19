import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(resolve(__dirname, '../public'));
    app.enableCors();

    await app.listen(3001);
}
bootstrap();
