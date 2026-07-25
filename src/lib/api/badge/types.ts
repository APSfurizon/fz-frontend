import { MediaData } from "../media";
import { SponsorType } from "../user";

export interface FursuitDetails {
  id: number;
  name: string;
  species: string;
  propic?: MediaData;
  sponsorship: SponsorType;
}
export interface FursuitEventData {
  bringingToEvent: boolean;
  ownerId: number;
  showInFursuitCount: boolean;
  showOwner: boolean;
  fursuit: FursuitDetails;
}
