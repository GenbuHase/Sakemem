export type SakenowaBrand = {
  id: number;
  name: string;
  breweryId: number;
};

export type SakenowaBrewery = {
  id: number;
  name: string;
  areaId: number;
};

export type SakeSuggestion = {
  brandId: number;
  brandName: string;
  breweryName: string;
};
