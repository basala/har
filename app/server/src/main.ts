import { NestFactory } from '@nestjs/core';
import {
    ExpressAdapter,
    NestExpressApplication,
} from '@nestjs/platform-express';
import { renderFile } from 'ejs';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule,
        new ExpressAdapter(),
        { bodyParser: false }
    );

    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ limit: '50mb', extended: true }));
    // app.useStaticAssets(resolve(__dirname, '../public'));
    app.engine('html', renderFile);
    app.enableCors();

    await app.listen(3001);
}
bootstrap();
