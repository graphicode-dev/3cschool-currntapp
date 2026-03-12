import { EyeIcon, EyeOffIcon } from "./auth.icons";
import {
    ArrowIcon,
    CalenderIcon,
    CameraIcon,
    ChatIcon,
    ClockIcon,
    EditIcon,
    EnvelopeIcon,
    FilterIcon,
    InstructorIcon,
    LogoutIcon,
    MagnifyingGlassIcon,
    QuestionIcon,
    QuizIcon,
    RobotIcon,
    SentIcon,
    SingleChatIcon,
    TrashIcon,
    XIcon,
} from "./general.icons";
import { BellIcon, ChatLoveIcon, ShareIcon } from "./home.icons";
import { GroupsIcon, HomeIcon, SupportIcon, UserIcon } from "./tab.icons";

export interface TabIconProps {
    size?: number;
    color: string;
    direction?: {
        up?: boolean;
        right?: boolean;
        down?: boolean;
        left?: boolean;
    };
}

export const Icons = {
    EyeIcon,
    EyeOffIcon,
    HomeIcon,
    SupportIcon,
    UserIcon,
    GroupsIcon,
    BellIcon,
    ChatLoveIcon,
    ShareIcon,
    ArrowIcon,
    CalenderIcon,
    ClockIcon,
    InstructorIcon,
    ChatIcon,
    QuizIcon,
    EditIcon,
    LogoutIcon,
    EnvelopeIcon,
    SingleChatIcon,
    SentIcon,
    XIcon,
    QuestionIcon,
    RobotIcon,
    CameraIcon,
    FilterIcon,
    MagnifyingGlassIcon,
    TrashIcon,
};
