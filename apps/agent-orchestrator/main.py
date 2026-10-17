# 메일 한 건을 딕셔너리로 묶고, mail이라는 변수에 저장합니다.
mail = {
    "subject": "견적서 수정 요청",
    "sender": "customer@example.com",
    "body": "수정한 견적서를 금요일까지 전달해주세요.",
}

# 항목 이름(key)으로 값(value)을 꺼내 터미널에 출력합니다.
print(mail["subject"])
print(mail["sender"])
print(mail["body"])
