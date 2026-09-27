interface OkResult<TSuccess, TError extends string> {
  ok: true;
  value: TSuccess;
  when<R>(onSuccess: (value: TSuccess) => R, onFail: (error: TError) => R): R;
}

interface FailResult<TSuccess, TError extends string> {
  ok: false;
  error: TError;
  when<R>(onSuccess: (value: TSuccess) => R, onFail: (error: TError) => R): R;
}

export type Result<TSuccess, TError extends string> =
  | OkResult<TSuccess, TError>
  | FailResult<TSuccess, TError>;

export function ok<TSuccess>(value: TSuccess): OkResult<TSuccess, never> {
  return {
    ok: true,
    value,
    when(onSuccess, _onFail) {
      return onSuccess(value);
    },
  };
}

export function fail<TError extends string>(error: TError): FailResult<never, TError> {
  return {
    ok: false,
    error,
    when(_onSuccess, onFail) {
      return onFail(error);
    },
  };
}
