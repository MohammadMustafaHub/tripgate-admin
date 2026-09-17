import { fail, ok, type Result } from '@/lib/result';
import { tenantSchema, type Tenant } from '@/models/tenant';
import { client, httpStatus } from './client';
import { parseSuccess } from './responses';

/** Details for creating a tenant. */
export interface CreateTenantRequest {
  /** Display name of the tenant. Max 100 characters. */
  name: string;
  /** Subdomain the tenant is reached under, e.g. "acme". */
  subdomain: string;
}

export type CreateTenantError =
  | 'ALREADY_HAS_TENANT'
  | 'SUBDOMAIN_TAKEN'
  | 'UNAUTHORIZED'
  | 'NETWORK'
  | 'UNEXPECTED';

/** Registers a tenant for the signed-in user. One tenant per account. */
export async function createTenant(
  request: CreateTenantRequest
): Promise<Result<Tenant, CreateTenantError>> {
  try {
    const response = await client.post('/api/tenancy/Tenants', request);

    const tenant = parseSuccess(response.data, tenantSchema);
    return tenant ? ok(tenant) : fail('UNEXPECTED');
  } catch (error) {
    switch (httpStatus(error)) {
      case 400:
        return fail('ALREADY_HAS_TENANT');
      case 401:
        return fail('UNAUTHORIZED');
      case 409:
        return fail('SUBDOMAIN_TAKEN');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}

export type GetCurrentTenantError =
  | 'NO_TENANT'
  | 'UNAUTHORIZED'
  | 'NETWORK'
  | 'UNEXPECTED';

/** The tenant the signed-in user belongs to. */
export async function getCurrentTenant(): Promise<
  Result<Tenant, GetCurrentTenantError>
> {
  try {
    const response = await client.get('/api/tenancy/Tenants');

    const tenant = parseSuccess(response.data, tenantSchema);
    return tenant ? ok(tenant) : fail('UNEXPECTED');
  } catch (error) {
    switch (httpStatus(error)) {
      case 401:
        return fail('UNAUTHORIZED');
      case 404:
        return fail('NO_TENANT');
      case null:
        return fail('NETWORK');
      default:
        return fail('UNEXPECTED');
    }
  }
}
