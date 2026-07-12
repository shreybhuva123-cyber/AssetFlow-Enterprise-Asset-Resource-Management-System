export interface Location {
  id: string;
  orgId: string;
  name: string;
  code: string;
  description?: string | null;
  parentId?: string | null;
  address?: LocationAddress | null;
  gps?: { lat: number; lng: number } | null;
  isActive: boolean;
  assetCount: number;
  children?: Location[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface CreateLocationInput {
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  address?: LocationAddress;
  gps?: { lat: number; lng: number };
}

export interface UpdateLocationInput extends Partial<CreateLocationInput> {
  isActive?: boolean;
}

export interface LocationFilters {
  parentId?: string | null;
  isActive?: boolean;
  search?: string;
}

export interface LocationTreeNode extends Location {
  children: LocationTreeNode[];
  depth: number;
  path: string[];
}
