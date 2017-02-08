g++ $(pkg-config --cflags glib-2.0 gobject-2.0) *.cpp $(pkg-config --libs glib-2.0 gobject-2.0)
