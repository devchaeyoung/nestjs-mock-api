import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { DepartmentsModule } from './departments/departments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
        ...configService.get('mongodb.options'),
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('MongoDB 연결 성공');
          });
          connection.on('error', (err) => {
            console.error('MongoDB 연결 오류:', err);
          });
          connection.on('disconnected', () => {
            console.warn('MongoDB 연결 해제됨');
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: configService.get<string>('jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    DepartmentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

