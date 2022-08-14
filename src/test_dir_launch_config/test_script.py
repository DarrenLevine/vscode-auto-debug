import os

print(os.environ.get('RUNNING_TEST'))

assert os.environ.get('RUNNING_TEST') == 'true'

a = 1
a += 1
a += 1
a += 1
a += 1
a += 1
a += 1

print(a)
