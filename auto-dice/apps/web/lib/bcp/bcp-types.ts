export type BcpListSuccess = {
  status: "ok";
  lists: { id: string; name: string }[];
};

export type BcpListFailure = {
  status: "rate_limited" | "network" | "error";
  message: string;
};

export type BcpListResponse = BcpListSuccess | BcpListFailure;
