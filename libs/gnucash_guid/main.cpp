#include <stdio.h>
#include "guid.hpp"

int main() {
    gnc::GUID id;
    std::string sid;

    for (size_t i = 0; i < 1000; ++i) {
        id = gnc::GUID::create_random();
        sid = id.to_string();

        printf("%s\n", sid.c_str());
    }

    return 0;
}
