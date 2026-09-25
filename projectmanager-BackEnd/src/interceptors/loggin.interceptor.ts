import { BadGatewayException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, map, Observable, of, tap, throwError } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const now = Date.now()
    return next.handle().pipe(tap(() => console.log(`Response time: ${Date.now() - now}ms`)))

  }

}
