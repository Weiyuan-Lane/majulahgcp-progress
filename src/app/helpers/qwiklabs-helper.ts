import { 
    QwiklabsProfileBadge, 
    QwiklabsProfileUser, 
    FetchQwiklabsProfileStatus,
    QwiklabsQuestBadge,
} from  '@app/types/qwiklabs';
import QuestBadges from '@app/static/quests.json';
import Campaign from '@app/static/campaign.json';

const HTTP_PROTOCOL = 'http';
const HTTPS_PROTOCOL = 'https';
const PROFILE_LINK_REGEX = /^(?:(?:https|http)\:\/\/|)(?:www|google)\.qwiklabs\.com\/public_profiles\/[a-zA-Z0-9-]+$/
const CORS_PROXY = 'https://weiyuan-cors-anywhere.herokuapp.com';

const FROM_TIME = new Date(Campaign.from);
const TO_TIME = new Date(Campaign.to);

export default class QwiklabsHelper {
    static isProfileLinkCorrect(link: string): boolean {
        if (link.match(PROFILE_LINK_REGEX)) {
            return true;
        }

        return false;
    }

    static isLinkStartsWithProtocol(link: string): boolean {
        const result = link.startsWith(HTTP_PROTOCOL) || link.startsWith(HTTPS_PROTOCOL);

        return result;
    }

    static getUncompletedBadges(completedProfileBadges: QwiklabsProfileBadge[]): QwiklabsQuestBadge[] {
        const uncompletedBadges: QwiklabsQuestBadge[] = [];
        const completedTitleMap: Set<string> = new Set<string>();

        completedProfileBadges.forEach((completedProfileBadge) => {
            completedTitleMap.add(completedProfileBadge.title);
        });

        QuestBadges.forEach((questBadge) => {
            if (!completedTitleMap.has(questBadge.title)) {
                uncompletedBadges.push(questBadge);
            }
        })

        return uncompletedBadges;
    }

    static getCompletedBadges(completedProfileBadges: QwiklabsProfileBadge[]): QwiklabsQuestBadge[] {
        const completedBadges: QwiklabsQuestBadge[] = [];
        const completedTitleMap: Set<string> = new Set<string>();

        completedProfileBadges.forEach((completedProfileBadge) => {
            completedTitleMap.add(completedProfileBadge.title);
        });

        QuestBadges.forEach((questBadge) => {
            if (completedTitleMap.has(questBadge.title)) {
                completedBadges.push(questBadge);
            }
        })

        return completedBadges;
    }

    static getCompletedBadgesInCampaignTimeRange(completedProfileBadges: QwiklabsProfileBadge[]): QwiklabsQuestBadge[] {
        const timeRangedBadges: QwiklabsProfileBadge[] = completedProfileBadges.filter((completedProfileBadge) => {
            return completedProfileBadge.earnedDate > FROM_TIME && completedProfileBadge.earnedDate <= TO_TIME;
        });

        const completedBadges = this.getCompletedBadges(timeRangedBadges);
        return completedBadges;
    }

    static async getProfileFrom(link: string): Promise<FetchQwiklabsProfileStatus> {
        let currentLink = link;

        if (!this.isProfileLinkCorrect(currentLink)) {
            throw new Error('Don\'t give me links without verification pls :(');
        }

        if (!this.isLinkStartsWithProtocol(currentLink)) {
            currentLink = `https://${currentLink}`;
        }

        let result: FetchQwiklabsProfileStatus;
        try {
            const fetchedResponse = await fetch(`${CORS_PROXY}/${currentLink}`);
            const responseText = await fetchedResponse.text();
            const responseDoc = new DOMParser().parseFromString(responseText, "text/html");

            result = {
                user: this.getProfileUserFrom(responseDoc),
                badges: this.getProfileBadgesFrom(responseDoc),
                error: null,
            }

        } catch (e) {
            const errUser: QwiklabsProfileUser = {
                name: '',
                imageUrl: '',
                profileText: '',
            };

            result = {
                user: errUser,
                badges: [],
                error: e, 
            };
        }

        return result;
    }

    private static getProfileBadgesFrom(doc: Document): QwiklabsProfileBadge[] {
        const mainWrapper = doc.getElementById('main-wrapper');
        const profileBadgeCollection = mainWrapper.getElementsByClassName('public-profile__badge');

        const profileBadges: QwiklabsProfileBadge[] = [];

        for (let i = 0; i < profileBadgeCollection.length; i++) {
            const profileBadgeElements = profileBadgeCollection[i].getElementsByTagName('div');
            if (profileBadgeElements.length !== 3) {
                continue
            }

            const title = profileBadgeElements[1].innerText;
            const parsedTitle = title.replace(/\r|\n/g, '');
            const earnedDateStr = profileBadgeElements[2].innerText;
            const parsedDateStr = earnedDateStr.replace(/\r|\n|Earned/g, '');

            profileBadges.push({
                title: parsedTitle,
                earnedDateStr: parsedDateStr,
                earnedDate: new Date(parsedDateStr),
            })
        }

        return profileBadges;
    }

    private static getProfileUserFrom(doc: Document): QwiklabsProfileUser {
        const mainWrapper = doc.getElementById('main-wrapper');
        const profileCollection = mainWrapper.getElementsByClassName('public-profile__hero')
        const voidUser = {
            name: '',
            imageUrl: '',
            profileText: '',
        };

        if (profileCollection.length === 0) {
            return voidUser;
        }

        const profileWrapper = profileCollection[0];
        const avatarCollection = profileWrapper.getElementsByClassName('avatar');

        if (avatarCollection.length === 0) {
            return voidUser;
        }

        const avatarElement = avatarCollection[0];
        const profileLines = profileWrapper.getElementsByClassName('l-mbm');

        if (profileLines.length < 1) {
            return voidUser;
        }

        const nameElement = profileLines[0];
        const descriptionElement = profileLines[1];

        const name = (nameElement as HTMLElement).innerText;
        const parsedName = name.replace(/\r|\n/g, '');
        
        const description = (descriptionElement as HTMLElement).innerText;
        let parsedDescription = description.replace(/(^(\r|\n))|((\r|\n)$)/g, '');
        parsedDescription = parsedDescription.replace(/\r|\n/g, ' ');

        const imageSrc = (avatarElement as HTMLImageElement).src;

        return {
            name: parsedName,
            imageUrl: imageSrc,
            profileText: parsedDescription,
        }
    }
}