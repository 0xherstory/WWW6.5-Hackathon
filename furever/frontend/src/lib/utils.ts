export function getStandalonePageKey(pathname: string) {
  if (pathname === "/cloud-adoption") return "cloudAdoption";
  if (pathname === "/donations") return "donations";
  return "home";
}
