from pydantic import BaseModel
from typing import Literal, Optional


class ActionUpdate(BaseModel):
    status: Optional[Literal["open", "done", "dismissed"]] = None
