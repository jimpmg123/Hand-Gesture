from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["profile"])


class ProfileResponse(BaseModel):
    firstName: str
    lastName: str
    userId: str
    email: str
    bio: str | None = None


class ProfileUpdateRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    bio: str | None = None


mock_profile = {
    "firstName": "Jae min",
    "lastName": "Jeon",
    "userId": "jaemin001",
    "email": "jaemin@example.com",
    "bio": "I like saving travel photos and checking places later.",
}


@router.get("/profile", response_model=ProfileResponse)
def get_profile():
    return mock_profile


@router.put("/profile", response_model=ProfileResponse)
def update_profile(payload: ProfileUpdateRequest):
    mock_profile["firstName"] = payload.firstName
    mock_profile["lastName"] = payload.lastName
    mock_profile["email"] = payload.email
    mock_profile["bio"] = payload.bio
    return mock_profile
