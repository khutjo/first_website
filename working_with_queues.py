from azure.storage.queue import QueueService, QueueMessageFormat


import os, uuid

# # this is what uou do is you need to make a queue

connect_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
queue_name = "messages"

print("Creating queue: " + queue_name)


queue_service = QueueService(connection_string=connect_str)
queue_service.create_queue(queue_name)

# Setup Base64 encoding and decoding functions
queue_service.encode_function = QueueMessageFormat.binary_base64encode
queue_service.decode_function = QueueMessageFormat.binary_base64decode


# # add a message to the queue
# message = u"whats up khutjo"
# print("Adding message: " + message)
# queue_service.put_message(queue_name, str.encode(message))

# # peek into the massages in the queue
# messages = queue_service.peek_messages(queue_name)

# for peeked_message in messages:
#     print("Peeked message: " + peeked_message.content.decode())


# # this is for editing the massages in the queue
# messages = queue_service.get_messages(queue_name)

# for message in messages:
#     queue_service.update_message(
#         queue_name, message.id, message.pop_receipt, 0, str.encode("whats up khutjo Again"))

        
# # get the message count fot the queue
# metadata = queue_service.get_queue_metadata(queue_name)
# count = metadata.approximate_message_count
# print("Message count: " + str(count))

# # read massages in the queue
# messages = queue_service.get_messages(queue_name)

# for message in messages:
#     print("Deleting message: " + message.content.decode())
    # # if you want it to delete the massage afterwards run this
    # queue_service.delete_message(queue_name, message.id, message.pop_receipt)

# # same as above but it takes a batch of massages
# messages = queue_service.get_messages(queue_name, num_messages=16, visibility_timeout=5*60)

# for message in messages:
#     print("Deleting message: " + message.content)
#     queue_service.delete_message(queue_name, message.id, message.pop_receipt)

# delete the full queue :[
# print("Deleting queue: " + queue_name)
# queue_service.delete_queue(queue_name)