import { createThirdwebClient } from "thirdweb";

const clientId =
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID?.trim() ||
  "00000000000000000000000000000000";

export const thirdwebClient = createThirdwebClient({ clientId });
