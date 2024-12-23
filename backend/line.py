import requests
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session



LINE_CHANNEL_ACCESS_TOKEN = "Ka7mKbqvKVp0CiBIcSGsJJbOCWCaOxRYVN7PRwq1Zb18A7qSATlyoNWes31FS6sp4vHkVvBlpQiSq50aZzN4Cub6oCSRIkJZLU6bOQLcdPNSloM/oFZU+ebEWK/zbXITU6W6p2ZfD3qQCHnRL6rSYAdB04t89/1O/w1cDnyilFU="

def send_line_flex_message(line_id: str):
    url = "https://api.line.me/v2/bot/message/push"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LINE_CHANNEL_ACCESS_TOKEN}",
    }
    payload = {
        "to": line_id,
        "messages": [
            {
                "type": "flex",
                "altText": "ขอบคุณสำหรับการเชื่อมต่อกับ GoGo Market",
                "contents": {
                    "type": "bubble",
                    "hero": {
                        "type": "image",
                        "url": "https://scontent.fbkk5-3.fna.fbcdn.net/v/t39.30808-6/438303751_10233237539737693_4325275099517205966_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeH30VpEFjzkwpRLAw-SMAlT5OTQ2qQs1u7k5NDapCzW7nDEsXSAiAURctvDErQjtDw&_nc_ohc=mW0kHecBoWYQ7kNvgFbT-cY&_nc_oc=AdifrZKtA-QAyxZS-7Dvm5THDskYAIa_WDVQjs8pGZUXvNUhROaFI5jmVkdtTEUq6VLkIARDidSWoTxLM_bYyNw1&_nc_zt=23&_nc_ht=scontent.fbkk5-3.fna&_nc_gid=ArjpIh5TG6zgckH7yDfic0F&oh=00_AYDfjZj2BO9PMDnjnRFmY_4ZhpyEasi85D38zQMKjMyzYw&oe=676F1C4F",  # Replace with your banner URL
                        "size": "full",
                        "aspectRatio": "20:13",
                        "aspectMode": "cover",
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "text",
                                "text": "ขอบคุณสำหรับการเชื่อมต่อ!",
                                "weight": "bold",
                                "size": "xl",
                                "align": "center",
                                "color": "#1DB446",
                            },
                            {
                                "type": "text",
                                "text": "คุณได้เชื่อมต่อบัญชีกับ GoGo Market แล้ว",
                                "wrap": True,
                                "margin": "md",
                                "align": "center",
                            },
                            {
                                "type": "text",
                                "text": "เราหวังว่าจะช่วยให้การจัดการร้านค้าของคุณง่ายขึ้น!",
                                "wrap": True,
                                "margin": "md",
                                "align": "center",
                            },
                        ],
                    },
                },
            }
        ],
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Failed to send LINE message: {response.text}",
        )


