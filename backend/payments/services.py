import requests
from django.conf import settings


class PortOneVerificationError(Exception):
    """포트원 결제 검증 과정에서 발생하는 에러"""
    pass


def get_payment_detail(payment_id: str) -> dict:
    """
    포트원 V2 서버에 결제 단건 조회를 요청한다.
    payment_id: 포트원이 결제 완료 후 발급한 고유 식별자 (프론트에서 전달받음)
    """
    url = f"https://api.portone.io/payments/{payment_id}"
    headers = {
        "Authorization": f"PortOne {settings.PORTONE_API_SECRET}"
    }

    try:
        response = requests.get(url, headers=headers, timeout=5)
    except requests.exceptions.RequestException as e:
        raise PortOneVerificationError(f"포트원 서버 통신 실패: {e}")

    if response.status_code != 200:
        raise PortOneVerificationError(
            f"포트원 조회 실패 (status={response.status_code}): {response.text}"
        )

    return response.json()
