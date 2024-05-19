import json
import requests


def main():
    prompt_id = "20ae8e60-c0d1-4f71-a058-ec471373d60a"
    api_key = "sk-8g2hUVAzJdb8YcZliHAovLjT3aQlLMF2rWMeW93crEmMUJc3WFNprm"

    # Describe the prompt (shows just the inputs for now)
    r1 = requests.get(f"https://app.wordware.ai/api/prompt/{prompt_id}/describe",
                      headers={"Authorization": f"Bearer {api_key}"})
    print(json.dumps(r1.json(), indent=4))

    # Execute the prompt
    r = requests.post(f"https://app.wordware.ai/api/prompt/{prompt_id}/run",
                      json={
                          "inputs": {
                              "new_input_1": {  # Use the label from the describe response
                                  "type": "image",
                                  "image_url": "https://i.insider.com/602ee9ced3ad27001837f2ac",
                              },
                          }
                      },
                      headers={"Authorization": f"Bearer {api_key}"},
                      stream=True
                      )

    # Ensure the request was successful
    if r.status_code != 200:
        print("Request failed with status code", r.status_code)
        print(json.dumps(r.json(), indent=4))
    else:
        for line in r.iter_lines():
            if line:
                content = json.loads(line.decode('utf-8'))
                value = content['value']
                # We can print values as they're generated
                if value['type'] == 'generation':
                    if value['state'] == "start":
                        print("\nNEW GENERATION -", value['label'])
                    else:
                        print("\nEND GENERATION -", value['label'])
                elif value['type'] == "chunk":
                    print(value['value'], end="")
                elif value['type'] == "outputs":
                    # Or we can read from the outputs at the end
                    # Currently we include everything by ID and by label - this will likely change in future in a breaking
                    # change but with ample warning
                    print("\nFINAL OUTPUTS:")
                    print(json.dumps(value, indent=4))


if __name__ == '__main__':
    main()