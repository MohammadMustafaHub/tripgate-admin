/** A user of the tenant and the roles they hold. */
export interface Employee {
  id: string;
  /** Iraqi phone number in the format 9647XXXXXXXXX; also the employee's login. */
  phoneNumber: string;
  phoneNumberConfirmed: boolean;
  roles: string[];
}
